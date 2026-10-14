using ECommerce.Application.Features.Authentication.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Authentication.Commands.Refresh
{
    public sealed record RefreshTokenCommand(string RefreshToken) : IRequest<LoginResponseDto>;
}