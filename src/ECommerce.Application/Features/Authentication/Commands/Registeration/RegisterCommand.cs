using MediatR;
namespace ECommerce.Application.Features.Authentication.Commands.Register;
public sealed record RegisterCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password
) : IRequest;