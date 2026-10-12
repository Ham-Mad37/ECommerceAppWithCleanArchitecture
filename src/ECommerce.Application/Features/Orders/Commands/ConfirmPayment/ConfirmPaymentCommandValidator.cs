using FluentValidation;

namespace ECommerce.Application.Features.Orders.Commands.ConfirmPayment
{
    public sealed class ConfirmPaymentCommandValidator : AbstractValidator<ConfirmPaymentCommand>
    {
        public ConfirmPaymentCommandValidator()
        {
            RuleFor(x => x.OrderId).GreaterThan(0);
            RuleFor(x => x.Reference).MaximumLength(100);
        }
    }
}