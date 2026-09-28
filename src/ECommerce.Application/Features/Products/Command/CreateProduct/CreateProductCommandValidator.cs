using FluentValidation;

namespace ECommerce.Application.Features.Products.Commands.CreateProduct
{
    public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
    {
        public CreateProductCommandValidator()
        {
            RuleFor(x => x.name)
            .NotEmpty()
            .MaximumLength(100);

            RuleFor(x => x.description)
            .MaximumLength(1000)
            .When(x => x.description is not null);

            RuleFor(x => x.price)
           .GreaterThanOrEqualTo(0);

            RuleFor(x => x.StockQuantity)
           .GreaterThanOrEqualTo(0);

            RuleFor(x => x.categoryId)
            .GreaterThan(0);

        }
    }
}