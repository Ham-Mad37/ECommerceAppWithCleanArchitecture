using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Dashboard.Common;
using ECommerce.Application.Features.Dashboard.DTOs;
using FluentValidation;
using MediatR;

namespace ECommerce.Application.Features.Dashboard.Queries.GetTopProducts
{
    public sealed record GetTopProductsQuery(DateTime? From = null, DateTime? To = null, int Take = 10)
        : IRequest<IReadOnlyList<TopProductDto>>, IDateRangeQuery;

    public sealed class GetTopProductsQueryValidator : DateRangeValidator<GetTopProductsQuery>
    {
        public GetTopProductsQueryValidator()
        {
            RuleFor(x => x.Take).InclusiveBetween(1, 50);
        }
    }

    public sealed class GetTopProductsQueryHandler
        : IRequestHandler<GetTopProductsQuery, IReadOnlyList<TopProductDto>>
    {
        private readonly IDashboardQueries _queries;
        public GetTopProductsQueryHandler(IDashboardQueries queries) => _queries = queries;

        public Task<IReadOnlyList<TopProductDto>> Handle(GetTopProductsQuery request, CancellationToken cancellationToken)
        {
            var (start, end) = DashboardDateRange.Resolve(request.From, request.To);
            return _queries.GetTopProductsAsync(start, end, request.Take, cancellationToken);
        }
    }
}