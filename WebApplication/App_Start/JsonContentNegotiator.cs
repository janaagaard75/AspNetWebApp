using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;

namespace CocaineCartels.WebApplication
{
    // Taken from http://www.strathweb.com/2013/06/supporting-only-json-in-asp-net-web-api-the-right-way/
    public class JsonContentNegotiator : IContentNegotiator
    {
        private readonly JsonMediaTypeFormatter JsonFormatter;

        public JsonContentNegotiator(JsonMediaTypeFormatter formatter)
        {
            JsonFormatter = formatter;
        }

        public ContentNegotiationResult Negotiate(
            Type type,
            HttpRequestMessage request,
            IEnumerable<MediaTypeFormatter> formatters)
        {
            return new ContentNegotiationResult(
                JsonFormatter,
                new MediaTypeHeaderValue("application/json"));
        }
    }
}
