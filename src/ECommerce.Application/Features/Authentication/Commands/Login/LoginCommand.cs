using ECommerce.Application.Features.Authentication.DTOs;
using MediatR;

public sealed record LoginCommand(
    string Email,
    string Password
) : IRequest<LoginResponseDto>;