using FluentValidation;

namespace ECommerce.Application.Features.Products.Commands.CreateProduct
{
    public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
    {
        public CreateProductCommandValidator()
        {
            RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

            RuleFor(x => x.Description)
            .MaximumLength(1000)
            .When(x => x.Description is not null);

            RuleFor(x => x.Price)
           .GreaterThanOrEqualTo(0);

            RuleFor(x => x.StockQuantity)
           .GreaterThanOrEqualTo(0);

            RuleFor(x => x.CategoryId)
            .GreaterThan(0);

        }
    }
}