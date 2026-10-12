using FluentValidation;

namespace ECommerce.Application.Features.Addresses.Commands.AddAddress
{
    public sealed class AddAddressCommandValidator : AbstractValidator<AddAddressCommand>
    {
        public AddAddressCommandValidator()
        {
            RuleFor(x => x.RecipientName).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Phone).NotEmpty().Matches(@"^\+?[0-9\s\-]{7,20}$")
                .WithMessage("Phone number is not valid.");
            RuleFor(x => x.Line1).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Line2).MaximumLength(200);
            RuleFor(x => x.City).NotEmpty().MaximumLength(100);
            RuleFor(x => x.State).MaximumLength(100);
            RuleFor(x => x.PostalCode).MaximumLength(20);
            RuleFor(x => x.Country).NotEmpty().MaximumLength(100);
        }
    }
}