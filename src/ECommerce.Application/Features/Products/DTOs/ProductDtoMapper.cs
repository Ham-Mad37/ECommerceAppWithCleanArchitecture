using ECommerce.Application.Common.Interfaces;
using ECommerce.Domain.Entities.Products;

namespace ECommerce.Application.Features.Products.DTOs
{
    public static class ProductDtoMapper
    {
        public static ProductListDto ToListDto(this Product product, IProductImageStorage storage)
        {
            var primary = product.Images.FirstOrDefault(i => i.IsPrimary)
                          ?? product.Images.OrderBy(i => i.SortOrder).FirstOrDefault();

            return new ProductListDto(
                product.Id,
                product.Name,
                product.Price,
                product.StockQuantity,
                product.IsActive,
                product.CategoryId,
                product.Category.Name,
                primary is null ? null : storage.GetUrl(primary.FileName));
        }

        public static ProductDto ToDto(this Product product, IProductImageStorage storage)
        {
            var images = product.Images
                .OrderBy(i => i.SortOrder)
                .Select(i => new ProductImageDto(i.Id, storage.GetUrl(i.FileName), i.IsPrimary, i.SortOrder))
                .ToList();

            return new ProductDto(
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.StockQuantity,
                product.CategoryId,
                product.Category.Name,
                product.IsActive,
                product.CreatedAt,
                product.UpdatedAt,
                images);
        }
    }
}