using Application.Repository;
using System;
using System.Collections.Generic;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;

namespace Infastructure.Repository
{
    public class OcrRepository : IOcr
    {
        private readonly HttpClient _httpClient;

        public OcrRepository(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> RecognizeLatexAsync(byte[] imageBytes)
        {
            try
            {
                using var content = new MultipartFormDataContent();

                var imageContent = new ByteArrayContent(imageBytes);
                imageContent.Headers.ContentType = MediaTypeHeaderValue.Parse("image/png");

                content.Add(imageContent, "file", "upload.png");

                string _ocrUrl = "http://ocr-api:5000/predict";
                var response = await _httpClient.PostAsync(_ocrUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<OcrResponse>();
                    return result?.Latex ?? string.Empty;
                }

                return "Image processing error.";
            }
            catch (Exception ex)
            {
                return $"OCR connection error: {ex.Message}";
            }
        }

        private class OcrResponse
        {
            [System.Text.Json.Serialization.JsonPropertyName("latex")]
            public string Latex { get; set; } = string.Empty;
        }
    }
}
