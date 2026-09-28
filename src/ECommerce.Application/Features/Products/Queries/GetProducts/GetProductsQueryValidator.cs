using System.Security.Cryptography.X509Certificates;
using FluentValidation;

namespace ECommerce.Application.Features.Products.Queries.GetProducts
{
    public sealed class GetProductsQueryValidator : AbstractValidator<GetProductsQuery>
    {
        public GetProductsQueryValidator()
        {
            RuleFor(x => x.pageNumber)
            .GreaterThan(0);
            RuleFor(x => x.pageSize)
            .InclusiveBetween(1, 100);
        }
    }
}