using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Dashboard.DTOs;
using ECommerce.Domain.Entities.Orders;
using ECommerce.Domain.Entities.Payments;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories
{
    public sealed class DashboardQueries : IDashboardQueries
    {
        private readonly AppDbContext _context;
        public DashboardQueries(AppDbContext context) => _context = context;

        public async Task<DashboardSummaryDto> GetSummaryAsync(
            DateTime start, DateTime end, CancellationToken cancellationToken)
        {
            var endExclusive = end.AddDays(1);

            var orders = _context.Orders.AsNoTracking()
                .Where(o => o.CreatedAt >= start && o.CreatedAt < endExclusive);

            var statusCounts = await orders
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            var activeOrders = orders.Where(o => o.Status != OrderStatus.Cancelled);
            var activeCount = await activeOrders.CountAsync(cancellationToken);
            var grossSales = await activeOrders.SumAsync(o => o.Total, cancellationToken);

            var payments =
                from p in _context.Payments.AsNoTracking()
                join o in orders on p.OrderId equals o.Id
                select p;

            var collected = await payments
                .Where(p => p.Status == PaymentStatus.Paid)
                .SumAsync(p => p.Amount, cancellationToken);

            var outstanding = await payments
                .Where(p => p.Status == PaymentStatus.Pending)
                .SumAsync(p => p.Amount, cancellationToken);

            var refundsDue = await payments
                .CountAsync(p => p.Status == PaymentStatus.RefundDue, cancellationToken);

            var newCustomers = await _context.Customers.AsNoTracking()
                .CountAsync(c => c.CreatedAt >= start && c.CreatedAt < endExclusive, cancellationToken);

            var byStatus = Enum.GetValues<OrderStatus>().ToDictionary(
                s => s.ToString(),
                s => statusCounts.FirstOrDefault(x => x.Status == s)?.Count ?? 0);

            return new DashboardSummaryDto(
                From: start,
                To: end,
                TotalOrders: statusCounts.Sum(x => x.Count),
                CancelledOrders: byStatus[OrderStatus.Cancelled.ToString()],
                GrossSales: grossSales,
                CollectedRevenue: collected,
                OutstandingPayments: outstanding,
                RefundsDue: refundsDue,
                AverageOrderValue: activeCount == 0 ? 0m : Math.Round(grossSales / activeCount, 2),
                NewCustomers: newCustomers,
                OrdersByStatus: byStatus);
        }

        public async Task<IReadOnlyList<TopProductDto>> GetTopProductsAsync(
            DateTime start, DateTime end, int take, CancellationToken cancellationToken)
        {
            var endExclusive = end.AddDays(1);

            var rows = await (
                from i in _context.OrderItems.AsNoTracking()
                join o in _context.Orders.AsNoTracking() on i.OrderId equals o.Id
                where o.CreatedAt >= start
                      && o.CreatedAt < endExclusive
                      && o.Status != OrderStatus.Cancelled
                group i by i.ProductId into g
                select new
                {
                    ProductId = g.Key,
                    ProductName = g.Max(x => x.ProductName),
                    UnitsSold = g.Sum(x => x.Quantity),
                    Revenue = g.Sum(x => x.Quantity * x.UnitPrice)
                })
                .OrderByDescending(x => x.Revenue)
                .Take(take)
                .ToListAsync(cancellationToken);

            return rows
                .Select(x => new TopProductDto(x.ProductId, x.ProductName, x.UnitsSold, x.Revenue))
                .ToList();
        }

        public async Task<IReadOnlyList<DailySalesDto>> GetSalesByDayAsync(
            DateTime start, DateTime end, CancellationToken cancellationToken)
        {
            var endExclusive = end.AddDays(1);

            var rows = await _context.Orders.AsNoTracking()
                .Where(o => o.CreatedAt >= start
                            && o.CreatedAt < endExclusive
                            && o.Status != OrderStatus.Cancelled)
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new { Date = g.Key, Orders = g.Count(), Sales = g.Sum(o => o.Total) })
                .ToListAsync(cancellationToken);

            var byDate = rows.ToDictionary(x => x.Date);

            // Fill days with no orders so the result is ready to chart.
            var result = new List<DailySalesDto>();
            for (var day = start; day <= end; day = day.AddDays(1))
            {
                result.Add(byDate.TryGetValue(day, out var row)
                    ? new DailySalesDto(day, row.Orders, row.Sales)
                    : new DailySalesDto(day, 0, 0m));
            }
            return result;
        }

        public async Task<IReadOnlyList<LowStockProductDto>> GetLowStockAsync(
            int threshold, int take, CancellationToken cancellationToken)
        {
            return await _context.Products.AsNoTracking()
                .Where(p => p.IsActive && p.StockQuantity <= threshold)
                .OrderBy(p => p.StockQuantity)
                .ThenBy(p => p.Name)
                .Take(take)
                .Select(p => new LowStockProductDto(p.Id, p.Name, p.Category.Name, p.StockQuantity))
                .ToListAsync(cancellationToken);
        }
    }
}