data "google_project" "voice_ii_men" {
  project_id = var.project_id
}

locals {
  services = [
    "cloudbuild.googleapis.com",
    "cloudfunctions.googleapis.com",
    "firestore.googleapis.com",
    "texttospeech.googleapis.com",
  ]
}

resource "google_project_service" "voice_ii_men" {
  for_each                   = toset(local.services)
  project                    = data.google_project.voice_ii_men.id
  service                    = each.key
  disable_dependent_services = true
  disable_on_destroy         = false
}
