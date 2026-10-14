namespace ECommerce.Application.Features.Dashboard.DTOs;
public sealed record DailySalesDto(
       DateTime Date,
       int Orders,
       decimal Sales);
