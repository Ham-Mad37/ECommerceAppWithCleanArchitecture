using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Authentication.DTOs;
using MediatR;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponseDto>
{
    private readonly IAuthenticationService _authenticationService;

    public LoginCommandHandler(IAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        return await _authenticationService.LoginAsync(request.Email, request.Password, cancellationToken);
    }
}