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

            RuleFor(x => x.CategoryId)
            .GreaterThan(0)
            .When(x => x.CategoryId.HasValue);

            RuleFor(x => x.SortBy)
            .Must(BeValidSortField)
            .WithMessage("SortBy must be one of: id, name, price, stockQuantity.");

            RuleFor(x => x.SortDirection)
           .Must(x =>
               x.Equals("asc", StringComparison.OrdinalIgnoreCase) ||
               x.Equals("desc", StringComparison.OrdinalIgnoreCase))
           .WithMessage(
               "SortDirection must be either asc or desc.");
        }

        private static bool BeValidSortField(string sortBy)
        {
            return sortBy.Equals("id", StringComparison.OrdinalIgnoreCase)
                || sortBy.Equals("name", StringComparison.OrdinalIgnoreCase)
                || sortBy.Equals("price", StringComparison.OrdinalIgnoreCase)
                || sortBy.Equals("stockQuantity", StringComparison.OrdinalIgnoreCase);
        }
    }
}