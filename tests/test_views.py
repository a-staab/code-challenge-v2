import pytest
from datetime import date

from django.shortcuts import reverse
from rest_framework.test import APIClient

from map.models import CommunityArea, RestaurantPermit


@pytest.mark.django_db
def test_map_data_view():
    # Create some test community areas
    area1 = CommunityArea.objects.create(name="Beverly", area_id="1")
    area2 = CommunityArea.objects.create(name="Lincoln Park", area_id="2")

    # Test permits for Beverly
    RestaurantPermit.objects.create(
        community_area_id=area1.area_id, issue_date=date(2021, 1, 15)
    )
    RestaurantPermit.objects.create(
        community_area_id=area1.area_id, issue_date=date(2021, 2, 20)
    )

    # Test permits for Lincoln Park
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2021, 3, 10)
    )
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2021, 2, 14)
    )
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2021, 6, 22)
    )

    # Query the map data endpoint
    client = APIClient()
    response = client.get(reverse("map_data", query={"year": 2021}))

    # TODO: Complete the test by asserting that the /map-data/ endpoint
    # returns the correct number of permits for Beverly and Lincoln 
    # Park in 2021

    actual_num_permits_Beverly = 0
    actual_num_permits_LincolnPark = 0
    
    for data in response.data:
        if data.get('name') == "Beverly":
            actual_num_permits_Beverly = data.get('num_permits')
        if data.get('name') == "Lincoln Park":
            actual_num_permits_LincolnPark = data.get('num_permits')
    
    expected_num_permits_Beverly = 2
    assert actual_num_permits_Beverly == expected_num_permits_Beverly
    
    expected_num_permits_LincolnPark = 3
    assert actual_num_permits_LincolnPark == actual_num_permits_LincolnPark

    assert len(response.data) == 2
    

