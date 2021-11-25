resource "google_app_engine_application" "voice_ii_men" {
  project       = data.google_project.voice_ii_men.project_id
  location_id   = var.region
  database_type = "CLOUD_FIRESTORE"
}
