using System.Data;
using ECommerce.Application.Common.Features.Products.Command.UpdateProduct;
using FluentValidation;

namespace ECommerce.Application.Features.Products.Commands.UpdateProduct
{
    public sealed class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
    {
        public UpdateProductCommandValidator()
        {
            RuleFor(x => x.id)
            .GreaterThan(0);

            RuleFor(x => x.name)
            .NotEmpty()
            .MaximumLength(100);

            RuleFor(x => x.description)
            .MaximumLength(1000)
            .When(x => x.description is not null);

            RuleFor(x => x.price)
            .GreaterThanOrEqualTo(0);

            RuleFor(x => x.stcokQuantity)
            .GreaterThanOrEqualTo(0);

            RuleFor(x => x.categoryId)
            .GreaterThan(0);
        }
    }
}