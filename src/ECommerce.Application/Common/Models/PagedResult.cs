namespace ECommerce.Application.Common.Modles
{
    public class PagedResult<T>(IReadOnlyCollection<T> Itesm,int PageNumber,int PageSize,int TotalCount)
    {
        public int TotalCount => (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}