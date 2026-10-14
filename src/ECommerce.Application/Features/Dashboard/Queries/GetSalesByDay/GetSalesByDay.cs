using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Dashboard.Common;
using ECommerce.Application.Features.Dashboard.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Dashboard.Queries.GetSalesByDay
{
    public sealed record GetSalesByDayQuery(DateTime? From = null, DateTime? To = null)
        : IRequest<IReadOnlyList<DailySalesDto>>, IDateRangeQuery;

    public sealed class GetSalesByDayQueryValidator : DateRangeValidator<GetSalesByDayQuery> { }

    public sealed class GetSalesByDayQueryHandler
        : IRequestHandler<GetSalesByDayQuery, IReadOnlyList<DailySalesDto>>
    {
        private readonly IDashboardQueries _queries;
        public GetSalesByDayQueryHandler(IDashboardQueries queries) => _queries = queries;

        public Task<IReadOnlyList<DailySalesDto>> Handle(GetSalesByDayQuery request, CancellationToken cancellationToken)
        {
            var (start, end) = DashboardDateRange.Resolve(request.From, request.To);
            return _queries.GetSalesByDayAsync(start, end, cancellationToken);
        }
    }
}