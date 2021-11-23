resource "google_storage_bucket" "text_to_speech" {
  name     = join("-", [var.project_id, "text-to-speech"])
  location = "ASIA-NORTHEAST1"
}
