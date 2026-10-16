using ECommerce.Application.Features.Authentication.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Authentication.Queries.GetMyProfile
{
    public sealed record GetMyProfileQuery : IRequest<UserProfileDto>;
}