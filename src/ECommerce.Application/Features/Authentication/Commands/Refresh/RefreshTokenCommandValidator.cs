using FluentValidation;

namespace ECommerce.Application.Features.Authentication.Commands.Refresh
{
    public sealed class RefreshTokenCommandValidator :AbstractValidator<RefreshTokenCommand>
    {
        public RefreshTokenCommandValidator()
        {
            RuleFor(x => x.RefreshToken).NotEmpty().MaximumLength(200);
        }
    }
}