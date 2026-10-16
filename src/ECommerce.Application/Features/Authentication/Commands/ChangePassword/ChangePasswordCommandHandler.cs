using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Authentication.Commands.ChangePassword
{
    public sealed class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand>
    {
        private readonly IAuthenticationService _authService;
        private readonly ICurrentUser _currentUser;
        public ChangePasswordCommandHandler(IAuthenticationService authService, ICurrentUser currentUser)
        {
            _authService = authService;
            _currentUser = currentUser;
        }

        public Task Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
                throw new UnauthorizedAccessException();

            return _authService.ChangePasswordAsync(_currentUser.UserId, request.CurrentPassword, request.NewPassword, cancellationToken);
        }
    }
}