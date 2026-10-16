using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Authentication.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Authentication.Queries.GetMyProfile
{
    public sealed class GetMyProfileQueryHandler : IRequestHandler<GetMyProfileQuery, UserProfileDto>
    {
        private readonly IAuthenticationService _authService;
        private readonly ICurrentUser _currentUser;

        public GetMyProfileQueryHandler(IAuthenticationService authService, ICurrentUser currentUser)
        {
            _authService = authService;
            _currentUser = currentUser;
        }
        public Task<UserProfileDto> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
                throw new UnauthorizedAccessException();

            return _authService.GetProfileAsync(_currentUser.UserId, cancellationToken);
        }
    }
    
}