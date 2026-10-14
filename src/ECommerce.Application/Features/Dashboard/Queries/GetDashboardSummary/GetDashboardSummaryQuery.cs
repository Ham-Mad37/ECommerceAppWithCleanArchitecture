using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Dashboard.Common;
using ECommerce.Application.Features.Dashboard.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Dashboard.Queries.GetDashboardSummary
{
    public sealed record GetDashboardSummaryQuery(DateTime? From = null, DateTime? To = null)
        : IRequest<DashboardSummaryDto>, IDateRangeQuery;

    public sealed class GetDashboardSummaryQueryValidator : DateRangeValidator<GetDashboardSummaryQuery> { }

    public sealed class GetDashboardSummaryQueryHandler
        : IRequestHandler<GetDashboardSummaryQuery, DashboardSummaryDto>
    {
        private readonly IDashboardQueries _queries;
        public GetDashboardSummaryQueryHandler(IDashboardQueries queries) => _queries = queries;

        public Task<DashboardSummaryDto> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
        {
            var (start, end) = DashboardDateRange.Resolve(request.From, request.To);
            return _queries.GetSummaryAsync(start, end, cancellationToken);
        }
    }
}