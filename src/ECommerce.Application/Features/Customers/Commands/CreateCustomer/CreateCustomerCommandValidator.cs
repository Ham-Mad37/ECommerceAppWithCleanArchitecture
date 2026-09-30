using FluentValidation;

namespace ECommerce.Application.Features.Customers.Command.CreateCustomer;
public sealed class CreateCustomerCommandValidator:AbstractValidator<CreateCustomerCommand>
{
    public CreateCustomerCommandValidator()
    {
        RuleFor(x => x.FirstName)
        .NotEmpty()
        .MaximumLength(100);

        RuleFor(x => x.LastName)
        .NotEmpty()
        .MaximumLength(100);

        RuleFor(x => x.Email)
        .NotEmpty()
        .MaximumLength(250)
        .EmailAddress();
    }
}