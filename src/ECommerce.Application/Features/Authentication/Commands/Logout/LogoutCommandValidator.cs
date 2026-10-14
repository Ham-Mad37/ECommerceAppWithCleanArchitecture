using FluentValidation;

namespace ECommerce.Application.Features.Authentication.Commands.Logout
{
    public sealed class LogoutCommandValidator : AbstractValidator<LogoutCommand>
    {
        public LogoutCommandValidator()
        {
            RuleFor(x => x.RefreshToken).NotEmpty().MaximumLength(200);
        }
    }
}