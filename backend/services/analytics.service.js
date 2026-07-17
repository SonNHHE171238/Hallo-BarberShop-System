const Booking = require('../models/booking.model');
const Order = require('../models/order.model');
const Service = require('../models/service.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

class AnalyticsService {
  async getDashboardData(chartTimeframe) {
    // All time for global stats
    const globalStart = new Date('2000-01-01');
    const globalEnd = new Date();
    globalEnd.setHours(23, 59, 59, 999);

    // Chart timeframe
    let chartStart = new Date();
    let chartEnd = new Date();
    chartEnd.setHours(23, 59, 59, 999);

    if (chartTimeframe === 'thisYear') {
      chartStart.setMonth(0, 1);
      chartStart.setHours(0, 0, 0, 0);
      chartEnd = new Date(chartStart.getFullYear(), 11, 31);
      chartEnd.setHours(23, 59, 59, 999);
    } else if (chartTimeframe === 'last7days' || chartTimeframe === '7days') {
      chartStart.setDate(chartStart.getDate() - 6);
      chartStart.setHours(0, 0, 0, 0);
    } else {
      // Default: thisMonth
      chartStart.setDate(1);
      chartStart.setHours(0, 0, 0, 0);
      chartEnd = new Date(chartStart.getFullYear(), chartStart.getMonth() + 1, 0);
      chartEnd.setHours(23, 59, 59, 999);
    }

    const [
      revenueChart,
      compositionStats,
      topPerformers,
      operationalOverview
    ] = await Promise.all([
      this.getRevenueChart(chartStart, chartEnd, chartTimeframe),
      this.getCompositionStats(globalStart, globalEnd),
      this.getTopPerformers(globalStart, globalEnd),
      this.getOperationalOverview(globalStart, globalEnd)
    ]);

    return {
      revenueChart,
      compositionStats,
      topPerformers,
      operationalOverview
    };
  }



  async getRevenueChart(start, end, chartTimeframe) {
    let groupFormat = "%Y-%m-%d"; // day (for thisMonth)
    if (chartTimeframe === 'thisYear') {
      groupFormat = "%Y-%m"; // month
    }

    const bookingsPipeline = [
      { $match: { bookingDate: { $gte: start, $lte: end }, status: 'completed' } },
      { $group: { _id: { $dateToString: { format: groupFormat, date: "$bookingDate", timezone: "+07:00" } }, total: { $sum: "$totalPrice" } } }
    ];

    const ordersPipeline = [
      { $match: { createdAt: { $gte: start, $lte: end }, status: 'completed' } },
      { $group: { _id: { $dateToString: { format: groupFormat, date: "$createdAt", timezone: "+07:00" } }, total: { $sum: "$totalAmount" } } }
    ];

    const [bookingsData, ordersData] = await Promise.all([
      Booking.aggregate(bookingsPipeline),
      Order.aggregate(ordersPipeline)
    ]);

    // Initialize full range map with 0s
    const mergedMap = new Map();
    
    if (chartTimeframe === 'thisYear') {
      for (let i = 0; i < 12; i++) {
        const d = new Date(start.getFullYear(), i, 1);
        const yyyy = d.getFullYear();
        const mm = String(i + 1).padStart(2, '0');
        const key = `${yyyy}-${mm}`;
        mergedMap.set(key, { label: key, service: 0, product: 0, total: 0 });
      }
    } else {
      // 'thisMonth' or 'last7days' or '7days'
      // Tính số ngày
      const dayDiff = Math.round((end - start) / (1000 * 60 * 60 * 24));
      for (let i = 0; i < dayDiff; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        mergedMap.set(key, { label: key, service: 0, product: 0, total: 0 });
      }
    }

    // Merge actual data into the predefined map
    bookingsData.forEach(b => {
      if (mergedMap.has(b._id)) {
        const item = mergedMap.get(b._id);
        item.service += b.total;
        item.total += b.total;
      }
    });
    
    ordersData.forEach(o => {
      if (mergedMap.has(o._id)) {
        const item = mergedMap.get(o._id);
        item.product += o.total;
        item.total += o.total;
      }
    });

    return Array.from(mergedMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }

  async getCompositionStats(start, end) {
    const bookings = await Booking.find({ bookingDate: { $gte: start, $lte: end }, status: 'completed' }).populate('services');
    
    const serviceCategoryMap = {
      cut: 0, perm: 0, color: 0, combo: 0, styling: 0, treatment: 0
    };
    let totalServiceRev = 0;

    bookings.forEach(b => {
      b.services.forEach(s => {
        const cat = s.category || 'cut';
        serviceCategoryMap[cat] = (serviceCategoryMap[cat] || 0) + (s.price || 0);
        totalServiceRev += (s.price || 0);
      });
    });

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end }, status: 'completed' }).populate('items.productId');
    const productCategoryMap = {};
    let totalProductRev = 0;

    orders.forEach(o => {
      o.items.forEach(item => {
        const cat = item.productId?.category?.name || 'Khác';
        productCategoryMap[cat] = (productCategoryMap[cat] || 0) + (item.quantity * item.priceAtPurchase);
        totalProductRev += (item.quantity * item.priceAtPurchase);
      });
    });

    return {
      service: {
        total: totalServiceRev,
        breakdown: serviceCategoryMap
      },
      product: {
        total: totalProductRev,
        breakdown: productCategoryMap
      }
    };
  }

  async getTopPerformers(start, end) {
    // Top Services
    const bookings = await Booking.find({ bookingDate: { $gte: start, $lte: end }, status: 'completed' }).populate('services');
    const serviceStats = {};
    let totalServiceRev = 0;

    bookings.forEach(b => {
      b.services.forEach(s => {
        const id = s._id.toString();
        if (!serviceStats[id]) {
          serviceStats[id] = { name: s.name, count: 0, revenue: 0 };
        }
        serviceStats[id].count += 1;
        serviceStats[id].revenue += (s.price || 0);
        totalServiceRev += (s.price || 0);
      });
    });

    const topServices = Object.values(serviceStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(s => ({ ...s, percentage: totalServiceRev > 0 ? (s.revenue / totalServiceRev * 100) : 0 }));

    // Top Products
    const orders = await Order.find({ createdAt: { $gte: start, $lte: end }, status: 'completed' }).populate('items.productId');
    const productStats = {};

    orders.forEach(o => {
      o.items.forEach(item => {
        if (!item.productId) return;
        const id = item.productId._id.toString();
        if (!productStats[id]) {
          productStats[id] = { 
            name: item.productId.name, 
            quantity: 0, 
            revenue: 0, 
            stock: item.productId.stockQuantity || 0 
          };
        }
        productStats[id].quantity += item.quantity;
        productStats[id].revenue += (item.quantity * item.priceAtPurchase);
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      topServices,
      topProducts
    };
  }

  async getOperationalOverview(start, end) {
    const allBookings = await Booking.find({ bookingDate: { $gte: start, $lte: end } });
    const allOrders = await Order.find({ createdAt: { $gte: start, $lte: end } });

    const totalBookings = allBookings.length;
    const successfulBookings = allBookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = allBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length;
    const noShowBookings = allBookings.filter(b => b.status === 'no_show').length;
    
    const completedBookings = allBookings.filter(b => b.status === 'completed');
    const completedOrders = allOrders.filter(o => o.status === 'completed');
    const totalInvoices = completedBookings.length + completedOrders.length;
    
    const productsSold = completedOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    
    const totalRev = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0) + completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    // Unique customers across bookings and orders
    const customers = new Set();
    completedBookings.forEach(b => {
      if (b.customerId) customers.add(b.customerId.toString());
      else if (b.customerPhone) customers.add(b.customerPhone);
    });
    completedOrders.forEach(o => {
      if (o.userId) customers.add(o.userId.toString());
      else if (o.customerPhone) customers.add(o.customerPhone);
    });
    
    const avgRevPerCustomer = customers.size > 0 ? totalRev / customers.size : 0;

    return {
      totalBookings,
      successfulBookings,
      cancelledBookings,
      noShowBookings,
      totalInvoices,
      productsSold,
      avgRevPerCustomer
    };
  }


}

module.exports = new AnalyticsService();
