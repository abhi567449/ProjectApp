import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Projects', href: '/projects' },
  { name: 'Teams', href: '/teams' },
  { name: 'Tasks', href: '/tasks' },
];

export default function Navigation() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/dashboard" className="text-xl font-bold text-yellow-600 hover:text-yellow-700">
                    ProjectHub
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        router.pathname === item.href
                          ? 'border-yellow-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      {session?.user?.image ? (
                        <Image
                          className="h-8 w-8 rounded-full"
                          src={session.user.image}
                          alt=""
                          width={32}
                          height={32}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-yellow-800">
                            {session?.user?.name?.[0] || session?.user?.email?.[0] || '?'}
                          </span>
                        </div>
                      )}
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/profile"
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => signOut()}
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block w-full text-left px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    router.pathname === item.href
                      ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                    'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {session?.user?.image ? (
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={session.user.image}
                      alt=""
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-yellow-800">
                        {session?.user?.name?.[0] || session?.user?.email?.[0] || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {session?.user?.name || 'User'}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {session?.user?.email || ''}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Disclosure.Button
                  as={Link}
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Your Profile
                </Disclosure.Button>
                <Disclosure.Button
                  as="button"
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Sign out
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 