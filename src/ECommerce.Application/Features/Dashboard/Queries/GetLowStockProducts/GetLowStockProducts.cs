using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Dashboard.DTOs;
using FluentValidation;
using MediatR;

namespace ECommerce.Application.Features.Dashboard.Queries.GetLowStockProducts
{
    public sealed record GetLowStockProductsQuery(int Threshold = 5, int Take = 50)
        : IRequest<IReadOnlyList<LowStockProductDto>>;

    public sealed class GetLowStockProductsQueryValidator : AbstractValidator<GetLowStockProductsQuery>
    {
        public GetLowStockProductsQueryValidator()
        {
            RuleFor(x => x.Threshold).InclusiveBetween(0, 10000);
            RuleFor(x => x.Take).InclusiveBetween(1, 200);
        }
    }

    public sealed class GetLowStockProductsQueryHandler
        : IRequestHandler<GetLowStockProductsQuery, IReadOnlyList<LowStockProductDto>>
    {
        private readonly IDashboardQueries _queries;
        public GetLowStockProductsQueryHandler(IDashboardQueries queries) => _queries = queries;

        public Task<IReadOnlyList<LowStockProductDto>> Handle(GetLowStockProductsQuery request, CancellationToken cancellationToken)
            => _queries.GetLowStockAsync(request.Threshold, request.Take, cancellationToken);
    }
}