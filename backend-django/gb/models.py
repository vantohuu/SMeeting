from django.db import models
import pickle
from django_pandas.io import read_frame

# Create your models here.

class GB(models.Model):
    no_of_adults = models.IntegerField(default=0)
    no_of_children  = models.IntegerField(default=0)
    no_of_weekend_nights =  models.IntegerField(default=0)
    no_of_week_nights  = models.IntegerField(default=0)
    type_of_meal_plan =  models.IntegerField(default=0)
    required_car_parking_space =  models.IntegerField(default=0)
    room_type_reserved  =  models.IntegerField(default=0)
    lead_time = models.IntegerField(default=0)
    arrival_year = models.IntegerField(default=0)
    arrival_month = models.IntegerField(default=0)
    arrival_date = models.IntegerField(default=0)
    market_segment_type = models.IntegerField(default=0)
    repeated_guest = models.IntegerField(default=0)
    no_of_previous_cancellations = models.IntegerField(default=0)
    no_of_previous_bookings_not_canceled = models.IntegerField(default=0)
    avg_price_per_room = models.IntegerField(default=0)
    no_of_special_requests = models.IntegerField(default=0)
    
    def _str_(self):
        return self.no_of_adults
    
