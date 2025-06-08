from django.shortcuts import render
from rest_framework import viewsets
from .serializers import GBSerializer
from .models import GB
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import pickle
import pandas as pd
import numpy as np
from django_pandas.io import read_frame
import json
# from snippets.models import Snippet
# from snippets.serializers import SnippetSerializer

# Create your views here.


class GBView(viewsets.ModelViewSet):
    serializer_class = GBSerializer
    queryset = GB.objects.all()
# class GBMDView(viewsets.ModelViewSet):
  #  serializer_class = GBMDSerializer
 #   queryset = GB_Model.objects.all()

def nomalize(a, MAX):
  max = np.max(a)
  rate = max/MAX
  rate += 0.0000000001
  a = a / rate
  print(a)
  return a
def convert_topic(x):
  if x == "Entertainment":
    return 0
  elif x == "Politics":
    return 1
  elif x == "Gaming":
    return 2
  elif x == "Traffic":
    return 3
  elif x == "Economy":
    return 4
  elif x == "Study":
    return 5
  elif x == "Environment":
    return 6
  elif x == "Other":
    return 7
def convert_style(x):
  if x == "Serious":
    return 0
  elif x == "Normal":
    return 1
  elif x == "Friendly":
    return 2
  elif x == "Humorous":
    return 3
def convert_who(x):
  if x == "Manager":
    return 0
  elif x == "Other":
    return 1
  elif x == "Employee":
    return 2
  elif x == "Student":
    return 3
  elif x == "Teacher":
    return 4
def convert_impact(x):
  if x == "Very important":
    return 0
  elif x == "Not important":
    return 1
  elif x == "Important":
    return 2
def convert_workplace(x):
  if x == "Other":
    return 0
  elif x == "Library":
    return 1
  elif x == "Company":
    return 2
  elif x == "Milk tea cafe":
    return 3
  elif x == "Home":
    return 4
  elif x == "Class":
    return 5


def convert(data):
  data["WORKPLACE"] = data["WORKPLACE"].apply(convert_workplace)
  data["IMPACT"] = data["IMPACT"].apply(convert_impact)
  data["WHO"] = data["WHO"].apply(convert_who) 
  data["STYLE"] = data["STYLE"].apply(convert_style)
  data["TOPIC"] = data["TOPIC"].apply(convert_topic)

  
  data['CAPACITY'] =  nomalize(data['CAPACITY'], 1)
  data['TOPIC'] =  nomalize(data['TOPIC'], 3)
  data['AGE'] =  nomalize(data['AGE'], 2)
  data['SEX'] =  nomalize(data['SEX'], 2)
  data['STYLE'] =  nomalize(data['STYLE'], 6)  
  data['WHO'] =  nomalize(data['WHO'], 2)
  data['IMPACT'] =  nomalize(data['IMPACT'], 3)
  data['TIME'] =  nomalize(data['TIME'], 1)
  data['WORKPLACE'] =  nomalize(data['WORKPLACE'], 1)
  return data

@api_view(['POST'])
def predict(request):
    print(request.data)
    filename = 'D:\\STUDY\\HK7\\HETHONGTHONGMINH\\SmartMeeting\\backend-django\\model.pickle'
    load_model = pickle.load(open(filename, 'rb'))
    df = pd.DataFrame.from_dict(request.data["data_predict"], orient="index")
    print(df)
    df = df.transpose()
    df = convert(df)
    # print(df)
    result = load_model.predict(df)[0]
    print("data : ", df)
    print("kết quả : " + str(result))
    return Response(result, status=status.HTTP_201_CREATED)
