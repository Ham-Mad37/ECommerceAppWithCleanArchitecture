using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Authentication.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Authentication.Commands.Refresh
{
    public sealed class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, LoginResponseDto>
    {
        private readonly IAuthenticationService _authService;
        public RefreshTokenCommandHandler(IAuthenticationService authenticationService)
        {
            _authService = authenticationService;
        }
        public Task<LoginResponseDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        => _authService.RefreshTokenAsync(request.RefreshToken, cancellationToken);
    }
}