from app.services.argo_service import ArgoService
from app.services.timeline_service import TimelineService

# Instantiate services
argo_service = ArgoService()
timeline_service_instance = TimelineService(argo_service)

# Dependency
def get_timeline_service():
    return timeline_service_instance
