namespace ECommerce.Application.Features.Dashboard.DTOs;
public sealed record DashboardSummaryDto(
        DateTime From,
        DateTime To,
        int TotalOrders,
        int CancelledOrders,
        decimal GrossSales,
        decimal CollectedRevenue,
        decimal OutstandingPayments,
        int RefundsDue,
        decimal AverageOrderValue,
        int NewCustomers,
        IReadOnlyDictionary<string, int> OrdersByStatus);