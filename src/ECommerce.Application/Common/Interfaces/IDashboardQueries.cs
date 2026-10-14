using ECommerce.Application.Features.Dashboard.DTOs;

namespace ECommerce.Application.Common.Interfaces
{
    public interface IDashboardQueries
    {
        // start and end are whole dates; end is inclusive.
        Task<DashboardSummaryDto> GetSummaryAsync(DateTime start, DateTime end, CancellationToken cancellationToken);
        Task<IReadOnlyList<TopProductDto>> GetTopProductsAsync(DateTime start, DateTime end, int take, CancellationToken cancellationToken);
        Task<IReadOnlyList<DailySalesDto>> GetSalesByDayAsync(DateTime start, DateTime end, CancellationToken cancellationToken);
        Task<IReadOnlyList<LowStockProductDto>> GetLowStockAsync(int threshold, int take, CancellationToken cancellationToken);
    }
}