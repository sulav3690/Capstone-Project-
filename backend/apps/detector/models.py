import datetime
import mongoengine


class AnalysisRecord(mongoengine.Document):
    """
    MongoEngine Document containing the results of a text analysis.
    Stores the source text and scores (AI + Misinformation) for history pages.
    """
    user_id = mongoengine.StringField(required=True)
    input_text = mongoengine.StringField(required=True)
    ai_score = mongoengine.FloatField(required=True)
    misinformation_score = mongoengine.FloatField(required=True)
    detailed_breakdown = mongoengine.DictField(default=dict)
    created_at = mongoengine.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'analysis_records',
        'indexes': ['user_id', '-created_at']
    }


class AnalysisJob(mongoengine.Document):
    """
    MongoEngine Document tracking asynchronous Celery analysis tasks.
    A client gets a job_id and polls status until SUCCESS.
    """
    job_id = mongoengine.StringField(required=True, unique=True)
    status = mongoengine.StringField(
        choices=('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'),
        default='PENDING'
    )
    result_record_id = mongoengine.StringField(default="")
    created_at = mongoengine.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'analysis_jobs',
        'indexes': ['job_id']
    }
