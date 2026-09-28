using AutoMapper;
using ECommerce.Application.Features.Products.DTOs;
using ECommerce.Domain.Entities.Products;

namespace ECommerce.Application.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDto>();
            CreateMap<Product, ProductListDto>();
        }
    }
}