using FluentValidation;
namespace ECommerce.Application.Features.Orders.CreateOrder
{
    public sealed class CreateOrderCommandValidator:AbstractValidator<CreateOrderCommand>
    {
        public CreateOrderCommandValidator()
        {
            RuleFor(x => x.AddressId)
            .GreaterThan(0)
            .When(x => x.AddressId.HasValue);

            RuleFor(x => x.PaymentMethod)
            .IsInEnum()
            .When(x => x.PaymentMethod.HasValue);
        }
    }
}