using FluentValidation;

namespace ECommerce.Application.Features.Authentication.Commands.UpdateProfile
{
    public sealed class UpdateProfileCommandValidator:AbstractValidator<UpdateProfileCommand>
    {
        public UpdateProfileCommandValidator ()
        {
            RuleFor(x => x.FirstName)
            .NotEmpty()
            .MaximumLength(100);

            RuleFor(x => x.LastName)
            .NotEmpty()
            .MaximumLength(100);
        }
    }
}