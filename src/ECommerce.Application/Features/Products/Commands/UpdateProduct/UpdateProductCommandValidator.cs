using System.Data;
using ECommerce.Application.Common.Features.Products.Command.UpdateProduct;
using FluentValidation;

namespace ECommerce.Application.Features.Products.Commands.UpdateProduct
{
    public sealed class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
    {
        public UpdateProductCommandValidator()
        {
            RuleFor(x => x.Id)
            .GreaterThan(0);

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