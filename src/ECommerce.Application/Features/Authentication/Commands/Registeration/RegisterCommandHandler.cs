using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Authentication.Commands.Register;
using MediatR;

public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand>
{
    private readonly IAuthenticationService _authService;

    public RegisterCommandHandler(IAuthenticationService authService)
    {
        _authService = authService;
    }

    public async Task Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        await _authService.RegisterAsync(
            request.FirstName,
            request.LastName,
            request.Email,
            request.Password,
            cancellationToken
        );
    }
}