from wsgiref.simple_server import make_server
from pyramid.config import Configurator
from pyramid.response import Response
from pyramid.view import view_config
import argparse
import os
import sys
import json
from . import image

srcdir = os.path.dirname(os.path.abspath(__file__))

class ImageSet(object):
    __slots__ = ['picture_path', 'images']

    def __init__(self, picture_path):
        self.picture_path = os.path.abspath(picture_path)
        self.images = list(image.find_images(self.picture_path))

def hello_world(request):
    return Response('Hello %(name)s!' % request.matchdict)

@view_config(route_name='all', renderer='all.mako')
def all_view(self, request):
    return {'images': DATA.images}

@view_config(route_name='image', renderer='image.mako')
def image_view(self, request):
    image_id = int(request.matchdict['id'])
    img = DATA.images[image_id]
    return {'request': request, 'image_id': image_id, 'image': img}

@view_config(route_name='data')
def data_view(self, request):
    image_id = int(request.matchdict['id'])
    img = DATA.images[image_id]
    if request.method in ('GET', 'HEAD'):
        info = {'orientation': img.get_orientation()}
        return Response(json.dumps(info), content_type='application/json')

@view_config(route_name='save')
def save_view(self, request):
    left_eye_x = int(request.GET['left_eye_x'])
    left_eye_y = int(request.GET['left_eye_y'])
    right_eye_x = int(request.GET['right_eye_x'])
    right_eye_y = int(request.GET['right_eye_y'])

    response = Response()
    response.status = "200 OK"
    response.status_int = 200
    response.content_type = "text/plain"
    return response

def init():
    p = argparse.ArgumentParser()
    p.add_argument('picture_path')
    args = p.parse_args()
    global DATA
    DATA = ImageSet(args.picture_path)

def run():
    init()
    settings = {
        'reload_all': True,
        'debug_all': True,
        'mako.directories': os.path.join(srcdir, 'templates'),
    }
    config = Configurator(settings=settings)
    config.include('pyramid_mako')
    config.add_static_view('static', os.path.join(srcdir, 'static'))
    config.add_static_view('image-data', DATA.picture_path)
    config.add_route('all', '/image')
    config.add_route('image', '/image/{id}')
    config.add_route('data', '/data/{id}')
    config.add_route('save', '/save/{id}')
    config.scan()
    app = config.make_wsgi_app()
    server = make_server('0.0.0.0', 8080, app)
    server.serve_forever()

if __name__ == '__main__':
    run()
