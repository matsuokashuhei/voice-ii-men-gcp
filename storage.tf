resource "google_storage_bucket" "audio" {
  name     = join("-", [var.project_id, "audio"])
  location = var.region
  project  = data.google_project.voice_ii_men.project_id
}

resource "google_storage_default_object_access_control" "audio" {
  bucket = google_storage_bucket.audio.name
  role   = "READER"
  entity = "allUsers"
}

# # resource "google_compute_backend_bucket" "text_to_speech" {
# #   name        = join("-", [var.project_id, "text-to-speech"])
# #   bucket_name = google_storage_bucket.text_to_speech.name
# #   enable_cdn  = true
# # }

# resource "google_storage_bucket_access_control" "audio" {
#   bucket = google_storage_bucket.audio.name
#   role   = "READER"
#   entity = "allUsers"
#   depends_on = [
#     google_storage_bucket.audio
#   ]
# }
