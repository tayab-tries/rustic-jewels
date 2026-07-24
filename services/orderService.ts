import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { Order, OrderItem, OrderStatus } from "@/types";

const LOCAL_ORDERS_KEY = "rustic_db_orders";

// Helper to get local orders from localStorage (fallback)
function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Helper to save local orders
function setLocalOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

// Helper to generate UUID v4
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 version 4 compliant UUID generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const orderService = {
  // Generate unique sequential order ID: RJ-YEAR-000001
  async generateOrderId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `RJ-${currentYear}-`;

    if (!isSupabaseConfigured) {
      const orders = getLocalOrders();
      const count = orders.filter((o) => o.order_id.startsWith(prefix)).length;
      return `${prefix}${String(count + 1).padStart(6, "0")}`;
    }

    try {
      // Find count of orders this year to use as a starting sequence
      const startOfYear = `${currentYear}-01-01T00:00:00.000Z`;
      const endOfYear = `${currentYear}-12-31T23:59:59.999Z`;

      let count: number | null = null;
      try {
        const { count: fetchedCount, error } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfYear)
          .lte("created_at", endOfYear);
        
        if (!error) {
          count = fetchedCount;
        }
      } catch (e) {
        // Ignore RLS error and keep count as null
      }

      let checkSeq: number;
      if (count !== null && count !== undefined) {
        checkSeq = count + 1;
      } else {
        // Fallback for guest users with no select permission: use timestamp
        checkSeq = (Date.now() % 1000000) || 1;
      }
      
      // Let's verify if this order_id already exists to prevent race condition duplicate key errors
      let attempts = 0;
      while (attempts < 10) {
        const testId = `${prefix}${String(checkSeq).padStart(6, "0")}`;
        
        // Use SECURE stored procedure to check if order exists (works for guests!)
        const { data, error: rpcError } = await supabase.rpc("get_orders_by_search", {
          p_order_id: testId,
          p_phone: "",
          p_email: "",
        });
        
        if (!rpcError && (!data || data.length === 0)) {
          return testId;
        }
        
        // If it exists or error, try the next number
        if (count !== null && count !== undefined) {
          checkSeq++;
        } else {
          // If using timestamp-based sequence, select a new one or increment
          checkSeq = (checkSeq + 1) % 1000000;
        }
        attempts++;
      }
      // Ultimate fallback: timestamp with a 3-digit random suffix
      const randomSuffix = Math.floor(Math.random() * 1000);
      return `${prefix}${String((Date.now() % 1000) * 1000 + randomSuffix).padStart(6, "0")}`;
    } catch (err) {
      console.error("Error generating Order ID from Supabase", err);
      return `${prefix}${String(Date.now() % 1000000).padStart(6, "0")}`;
    }
  },

  // Place a new order
  async createOrder(
    orderInput: Omit<Order, "id" | "order_id" | "created_at" | "updated_at" | "status" | "rejection_reason" | "items">,
    cartItems: { listing_id: string; item_number: string; price: number; quantity: number }[]
  ): Promise<Order | null> {
    const order_id = await this.generateOrderId();
    const created_at = new Date().toISOString();
    const updated_at = created_at;
    const status: OrderStatus = "Pending Payment";

    if (!isSupabaseConfigured) {
      const orders = getLocalOrders();
      const id = Math.random().toString(36).substring(2, 9);
      
      const items: OrderItem[] = cartItems.map((item, idx) => ({
        id: `oi-${id}-${idx}`,
        order_id: id,
        listing_id: item.listing_id,
        item_number: item.item_number,
        price: item.price,
        quantity: item.quantity,
      }));

      const newOrder: Order = {
        ...orderInput,
        id,
        order_id,
        status,
        created_at,
        updated_at,
        items,
      };

      orders.push(newOrder);
      setLocalOrders(orders);
      return newOrder;
    }

    // Generate UUID on client to avoid INSERT RETURNING RLS SELECT check failure for guests
    const id = generateUUID();

    // Live mode save: insert Order row
    const { error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          id, // Pass generated UUID
          order_id,
          customer_name: orderInput.customer_name,
          phone: orderInput.phone,
          instagram_username: orderInput.instagram_username || null,
          email: orderInput.email || null,
          shipping_address: orderInput.shipping_address,
          city: orderInput.city,
          notes: orderInput.notes || null,
          subtotal: orderInput.subtotal,
          total: orderInput.total,
          status,
        },
      ]);

    if (orderError) {
      console.error("Failed to insert order in Supabase", orderError);
      return null;
    }

    // Insert Order items rows
    const itemsToInsert = cartItems.map((item) => ({
      order_id: id,
      listing_id: item.listing_id,
      item_number: item.item_number,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Failed to insert order items in Supabase", itemsError);
      // Delete order row on item insertion failure to maintain transactional integrity
      await supabase.from("orders").delete().eq("id", id);
      return null;
    }

    // Return locally constructed order details for immediate flow progression
    const newOrder: Order = {
      ...orderInput,
      id,
      order_id,
      status,
      created_at,
      updated_at,
      items: cartItems.map((item, idx) => ({
        id: `oi-${id}-${idx}`,
        order_id: id,
        listing_id: item.listing_id,
        item_number: item.item_number,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    return newOrder;
  },

  // Get single order with items
  async getOrderById(id: string): Promise<Order | null> {
    if (!isSupabaseConfigured) {
      const orders = getLocalOrders();
      return orders.find((o) => o.id === id) || null;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          listings (
            title,
            featured_image
          )
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      console.error("Error loading order detail from Supabase", error);
      return null;
    }

    // Format items
    const formattedItems = (data.order_items || []).map((oi: any) => ({
      id: oi.id,
      order_id: oi.order_id,
      listing_id: oi.listing_id,
      item_number: oi.item_number,
      price: oi.price,
      quantity: oi.quantity,
      listing_title: oi.listings?.title || "Unknown Piece",
      listing_image: oi.listings?.featured_image || "/placeholder-jewelry.jpg",
    }));

    const { order_items, ...rest } = data;
    return {
      ...rest,
      items: formattedItems,
    } as Order;
  },

  // Get single order by its readable Order ID
  async getOrderByOrderId(orderId: string): Promise<Order | null> {
    if (!isSupabaseConfigured) {
      const orders = getLocalOrders();
      return orders.find((o) => o.order_id === orderId) || null;
    }

    try {
      // Use SECURE stored procedure to load order details (works for guests!)
      const { data, error } = await supabase.rpc("get_orders_by_search", {
        p_order_id: orderId,
        p_phone: "",
        p_email: "",
      });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const order = data[0];
      // Ensure order_id is present inside each item for full compatibility
      if (order && order.items) {
        order.items = order.items.map((item: any) => ({
          ...item,
          order_id: order.id,
        }));
      }

      return order as Order;
    } catch (err) {
      console.error("Error loading order by order_id from RPC", err);
      return null;
    }
  },

  // Public Order Tracking
  async trackOrders(
    orderId: string,
    phone: string,
    email: string
  ): Promise<Order[]> {
    const cleanOrderId = orderId.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!isSupabaseConfigured) {
      const orders = getLocalOrders();
      if (!cleanOrderId && !cleanPhone && !cleanEmail) return [];

      return orders
        .filter((o) => {
          const matchId = cleanOrderId && o.order_id.toLowerCase() === cleanOrderId.toLowerCase();
          const matchPhone = cleanPhone && o.phone === cleanPhone;
          const matchEmail = cleanEmail && o.email?.toLowerCase() === cleanEmail.toLowerCase();
          return matchId || matchPhone || matchEmail;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    try {
      const { data, error } = await supabase.rpc("get_orders_by_search", {
        p_order_id: cleanOrderId,
        p_phone: cleanPhone,
        p_email: cleanEmail,
      });

      if (error) throw error;
      return (data || []) as Order[];
    } catch (err) {
      console.error("Failed to query order tracking from Supabase", err);
      return [];
    }
  },

  // Admin Dashboard List Orders
  async getAdminOrders(filters?: {
    search?: string;
    status?: string;
  }): Promise<Order[]> {
    if (!isSupabaseConfigured) {
      let list = getLocalOrders();
      
      if (filters?.status) {
        list = list.filter((o) => o.status === filters.status);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (o) =>
            o.order_id.toLowerCase().includes(q) ||
            o.customer_name.toLowerCase().includes(q) ||
            o.phone.includes(q) ||
            o.instagram_username?.toLowerCase().includes(q)
        );
      }
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    let query = supabase.from("orders").select(`
      *,
      order_items (
        *,
        listings (
          title
        )
      )
    `);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.search) {
      query = query.or(
        `order_id.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,instagram_username.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.error("Error loading admin orders", error);
      return [];
    }

    // Format
    return (data || []).map((o: any) => {
      const formattedItems = (o.order_items || []).map((oi: any) => ({
        id: oi.id,
        order_id: oi.order_id,
        listing_id: oi.listing_id,
        item_number: oi.item_number,
        price: oi.price,
        quantity: oi.quantity,
        listing_title: oi.listings?.title || "Unknown Piece",
      }));
      const { order_items, ...rest } = o;
      return {
        ...rest,
        items: formattedItems,
      };
    }) as Order[];
  },

  // Update order status (with auto sold on approval)
  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    rejectionReason?: string | null
  ): Promise<Order | null> {
    const updated_at = new Date().toISOString();

    if (!isSupabaseConfigured) {
      const orders = getLocalOrders();
      const idx = orders.findIndex((o) => o.id === id);
      if (idx === -1) return null;

      const order = orders[idx];
      order.status = status;
      order.rejection_reason = rejectionReason || null;
      order.updated_at = updated_at;

      orders[idx] = order;
      setLocalOrders(orders);

      // IF APPROVED: mark all items as Sold (is_available = false)
      if (status === "Approved") {
        await this.markOrderItemsAsSoldLocal(order);
      }

      return order;
    }

    const updateData: any = {
      status,
      updated_at,
      rejection_reason: rejectionReason || null,
    };

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to update order status", error);
      return null;
    }

    // IF APPROVED: mark items as sold in Supabase
    if (status === "Approved") {
      const orderDetail = await this.getOrderById(id);
      if (orderDetail) {
        await this.markOrderItemsAsSoldSupabase(orderDetail);
      }
    }

    return this.getOrderById(id);
  },

  // Helper to mark items as sold in local storage listings
  async markOrderItemsAsSoldLocal(order: Order) {
    if (!order.items) return;
    const listings = localStorage.getItem("rustic_db_listings");
    if (!listings) return;

    try {
      let list = JSON.parse(listings) as any[];
      let changed = false;

      order.items.forEach((orderItem) => {
        const listingIdx = list.findIndex((l) => l.id === orderItem.listing_id);
        if (listingIdx > -1) {
          const itemIdx = list[listingIdx].items.findIndex(
            (it: any) => it.item_number === orderItem.item_number
          );
          if (itemIdx > -1 && list[listingIdx].items[itemIdx].is_available) {
            list[listingIdx].items[itemIdx].is_available = false;
            changed = true;
          }
        }
      });

      if (changed) {
        localStorage.setItem("rustic_db_listings", JSON.stringify(list));
      }
    } catch (err) {
      console.error("Error updating inventory for local approved order", err);
    }
  },

  // Helper to mark items as sold in Supabase database
  async markOrderItemsAsSoldSupabase(order: Order) {
    if (!order.items) return;
    try {
      for (const orderItem of order.items) {
        // Find the listing item matching listing_id and item_number
        const { data: matchedItems } = await supabase
          .from("listing_items")
          .select("id")
          .eq("listing_id", orderItem.listing_id)
          .eq("item_number", orderItem.item_number);

        if (matchedItems && matchedItems.length > 0) {
          const ids = matchedItems.map((mi: any) => mi.id);
          await supabase
            .from("listing_items")
            .update({ is_available: false })
            .in("id", ids);
        }
      }
    } catch (err) {
      console.error("Failed to mark order items as sold in Supabase", err);
    }
  },
};
