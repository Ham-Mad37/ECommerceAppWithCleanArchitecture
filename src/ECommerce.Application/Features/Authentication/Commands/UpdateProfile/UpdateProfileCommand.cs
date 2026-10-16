using MediatR;

namespace ECommerce.Application.Features.Authentication.Commands.UpdateProfile
{
    public sealed record UpdateProfileCommand(string FirstName, string LastName) : IRequest;
}