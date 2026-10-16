
using MediatR;
namespace ECommerce.Application.Features.Authentication.Commands.ChangePassword
{
    public sealed record ChangePasswordCommand(string CurrentPassword, string NewPassword) : IRequest;
}
