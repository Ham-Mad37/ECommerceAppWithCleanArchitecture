using MediatR;

namespace ECommerce.Application.Features.Authentication.Commands.Logout
{
    public sealed record LogoutCommand(string RefreshToken) : IRequest;
}