using FluentValidation;

namespace ECommerce.Application.Features.Authentication.Commands.ChangePassword
{
    public sealed class ChangePasswordCommandValidator:AbstractValidator<ChangePasswordCommand>
    {
        public ChangePasswordCommandValidator()
        {
            RuleFor(x => x.CurrentPassword).NotEmpty();

            RuleFor(x=>x.NewPassword)
            .NotEmpty()
            .MinimumLength(8)
            .NotEqual(x=>x.CurrentPassword)
            .WithMessage("The new password must be different from the current one.");
        }
    }
}