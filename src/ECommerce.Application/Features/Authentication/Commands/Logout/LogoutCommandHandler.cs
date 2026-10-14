using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Authentication.Commands.Logout
{
    public sealed class LogoutCommandHandler : IRequestHandler<LogoutCommand>
    {
        private readonly IAuthenticationService _authService;
        public LogoutCommandHandler(IAuthenticationService authService)
        {
            _authService = authService;
        }
        public Task Handle(LogoutCommand request, CancellationToken cancellationToken)
        => _authService.LogoutAsync(request.RefreshToken, cancellationToken);
    }
}